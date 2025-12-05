/**
 * API Discovery
 * 
 * Automatically discovers and interacts with REST APIs.
 * Uses AI to understand API documentation and generate requests.
 */

import { geminiProvider } from '../ai/gemini-provider';

export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    parameters?: {
        name: string;
        type: string;
        required: boolean;
        description: string;
        location: 'path' | 'query' | 'body' | 'header';
    }[];
    responseSchema?: any;
    requiresAuth: boolean;
}

export interface APIProfile {
    baseUrl: string;
    name: string;
    version?: string;
    authType?: 'none' | 'apiKey' | 'bearer' | 'basic' | 'oauth2';
    authConfig?: {
        headerName?: string;
        tokenUrl?: string;
        clientId?: string;
    };
    endpoints: APIEndpoint[];
    discoveredAt: number;
}

export class APIDiscovery {
    private knownAPIs: Map<string, APIProfile> = new Map();

    /**
     * Discover API endpoints from OpenAPI/Swagger documentation
     */
    async discoverFromOpenAPI(specUrl: string): Promise<APIProfile> {
        console.log(`🔍 Discovering API from: ${specUrl}`);

        try {
            const response = await fetch(specUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch OpenAPI spec: ${response.status}`);
            }

            const spec = await response.json();

            const profile: APIProfile = {
                baseUrl: spec.servers?.[0]?.url || '',
                name: spec.info?.title || 'Unknown API',
                version: spec.info?.version,
                authType: this.detectAuthType(spec),
                endpoints: this.parseEndpoints(spec),
                discoveredAt: Date.now()
            };

            this.knownAPIs.set(profile.baseUrl, profile);
            console.log(`✅ Discovered ${profile.endpoints.length} endpoints for ${profile.name}`);

            return profile;
        } catch (error: any) {
            console.error('API discovery failed:', error.message);
            throw error;
        }
    }

    /**
     * Discover API by analyzing responses
     */
    async discoverByProbing(baseUrl: string, sampleEndpoints: string[] = ['/api', '/v1', '/health']): Promise<APIProfile> {
        console.log(`🔍 Probing API at: ${baseUrl}`);

        const discoveredEndpoints: APIEndpoint[] = [];

        for (const endpoint of sampleEndpoints) {
            try {
                const url = `${baseUrl}${endpoint}`;
                const response = await fetch(url, { method: 'GET' });

                if (response.ok) {
                    const data = await response.json();

                    // Use AI to understand the endpoint
                    const analysis = await this.analyzeEndpoint(endpoint, data);
                    if (analysis) {
                        discoveredEndpoints.push(analysis);
                    }
                }
            } catch {
                // Endpoint doesn't exist or failed - skip
            }
        }

        const profile: APIProfile = {
            baseUrl,
            name: `API at ${new URL(baseUrl).hostname}`,
            endpoints: discoveredEndpoints,
            authType: 'none',
            discoveredAt: Date.now()
        };

        this.knownAPIs.set(baseUrl, profile);
        return profile;
    }

    /**
     * Detect authentication type from OpenAPI spec
     */
    private detectAuthType(spec: any): APIProfile['authType'] {
        const securitySchemes = spec.components?.securitySchemes;
        if (!securitySchemes) return 'none';

        const schemeTypes = Object.values(securitySchemes) as any[];

        if (schemeTypes.some(s => s.type === 'oauth2')) return 'oauth2';
        if (schemeTypes.some(s => s.type === 'http' && s.scheme === 'bearer')) return 'bearer';
        if (schemeTypes.some(s => s.type === 'http' && s.scheme === 'basic')) return 'basic';
        if (schemeTypes.some(s => s.type === 'apiKey')) return 'apiKey';

        return 'none';
    }

    /**
     * Parse endpoints from OpenAPI spec
     */
    private parseEndpoints(spec: any): APIEndpoint[] {
        const endpoints: APIEndpoint[] = [];
        const paths = spec.paths || {};

        for (const [path, methods] of Object.entries(paths) as any) {
            for (const [method, details] of Object.entries(methods) as any) {
                if (!['get', 'post', 'put', 'delete', 'patch'].includes(method)) continue;

                const parameters = (details.parameters || []).map((p: any) => ({
                    name: p.name,
                    type: p.schema?.type || 'string',
                    required: p.required || false,
                    description: p.description || '',
                    location: p.in
                }));

                // Add request body parameters
                if (details.requestBody?.content?.['application/json']?.schema?.properties) {
                    const props = details.requestBody.content['application/json'].schema.properties;
                    const required = details.requestBody.content['application/json'].schema.required || [];

                    for (const [name, prop] of Object.entries(props) as any) {
                        parameters.push({
                            name,
                            type: prop.type || 'string',
                            required: required.includes(name),
                            description: prop.description || '',
                            location: 'body'
                        });
                    }
                }

                endpoints.push({
                    path,
                    method: method.toUpperCase() as any,
                    description: details.summary || details.description || '',
                    parameters,
                    requiresAuth: !!(details.security?.length || spec.security?.length)
                });
            }
        }

        return endpoints;
    }

    /**
     * Use AI to analyze an endpoint response
     */
    private async analyzeEndpoint(path: string, response: any): Promise<APIEndpoint | null> {
        const prompt = `Analyze this API endpoint and its response:

Endpoint: ${path}
Response: ${JSON.stringify(response, null, 2).substring(0, 2000)}

Return a JSON object describing this endpoint:
{
  "path": "${path}",
  "method": "GET",
  "description": "Brief description of what this endpoint does",
  "parameters": [],
  "requiresAuth": false
}

Return ONLY valid JSON.`;

        try {
            const result = await geminiProvider.generateResponse(prompt, false);
            const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return null;
        }
    }

    /**
     * Find the best endpoint for a given task
     */
    async findEndpointForTask(baseUrl: string, task: string): Promise<APIEndpoint | null> {
        const profile = this.knownAPIs.get(baseUrl);
        if (!profile || profile.endpoints.length === 0) return null;

        const prompt = `Given these API endpoints, which one best matches this task?

Task: "${task}"

Available Endpoints:
${profile.endpoints.map((e, i) => `${i}. ${e.method} ${e.path} - ${e.description}`).join('\n')}

Return ONLY the endpoint index number (0, 1, 2, etc.) or -1 if none match.`;

        try {
            const result = await geminiProvider.generateResponse(prompt, false);
            const index = parseInt(result.trim());

            if (index >= 0 && index < profile.endpoints.length) {
                return profile.endpoints[index];
            }
        } catch { }

        return null;
    }

    /**
     * Execute an API call
     */
    async executeCall(
        baseUrl: string,
        endpoint: APIEndpoint,
        params: Record<string, any>,
        auth?: { type: string; token?: string; username?: string; password?: string }
    ): Promise<any> {
        let url = `${baseUrl}${endpoint.path}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // Handle authentication
        if (auth) {
            if (auth.type === 'bearer' && auth.token) {
                headers['Authorization'] = `Bearer ${auth.token}`;
            } else if (auth.type === 'basic' && auth.username && auth.password) {
                const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
            } else if (auth.type === 'apiKey' && auth.token) {
                headers['X-API-Key'] = auth.token;
            }
        }

        // Handle path parameters
        for (const param of endpoint.parameters || []) {
            if (param.location === 'path' && params[param.name]) {
                url = url.replace(`{${param.name}}`, encodeURIComponent(params[param.name]));
            }
        }

        // Handle query parameters
        const queryParams = endpoint.parameters?.filter(p => p.location === 'query') || [];
        if (queryParams.length > 0) {
            const queryString = queryParams
                .filter(p => params[p.name] !== undefined)
                .map(p => `${p.name}=${encodeURIComponent(params[p.name])}`)
                .join('&');
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        // Handle body parameters
        const bodyParams = endpoint.parameters?.filter(p => p.location === 'body') || [];
        let body: any = undefined;
        if (bodyParams.length > 0 && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
            body = {};
            for (const param of bodyParams) {
                if (params[param.name] !== undefined) {
                    body[param.name] = params[param.name];
                }
            }
            body = JSON.stringify(body);
        }

        console.log(`📡 API Call: ${endpoint.method} ${url}`);

        const response = await fetch(url, {
            method: endpoint.method,
            headers,
            body
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get known API profile
     */
    getAPIProfile(baseUrl: string): APIProfile | undefined {
        return this.knownAPIs.get(baseUrl);
    }
}

export const apiDiscovery = new APIDiscovery();
