// src/lib/industries/television/installation.ts

/**
 * Television module - Installation support and guidance
 */

export interface InstallationRequest {
    id: string;
    customerName: string;
    phoneNumber: string;
    address: string;
    installationType: 'new' | 'relocation' | 'repair' | 'upgrade';
    preferredDate: string;
    status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    technicianName?: string;
    scheduledTime?: string;
    cost?: number;
}

/**
 * Request installation service
 */
export async function requestInstallation(
    customerName: string,
    phoneNumber: string,
    address: string,
    installationType: 'new' | 'relocation' | 'repair' | 'upgrade',
    preferredDate: string
): Promise<{ success: boolean; message: string; requestId?: string; estimatedCost?: number }> {
    // TODO: Create installation request in scheduling system

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const requestId = `INST${Date.now()}`;

    // Calculate estimated cost
    const costs = {
        new: 500,
        relocation: 200,
        repair: 150,
        upgrade: 300,
    };

    const estimatedCost = costs[installationType];

    return {
        success: true,
        message: `Installation request submitted successfully!\n\nRequest ID: ${requestId}\nType: ${installationType.toUpperCase()}\nEstimated Cost: K${estimatedCost}\n\nOur team will call you within 2 hours to confirm the appointment.\n\nWhat's included:\n• Professional installation\n• Signal optimization\n• Decoder setup\n• Basic training`,
        requestId,
        estimatedCost,
    };
}

/**
 * Get installation status
 */
export async function getInstallationStatus(requestId: string): Promise<InstallationRequest | null> {
    // TODO: Query installation system

    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        id: requestId,
        customerName: 'John Doe',
        phoneNumber: '+260970000000',
        address: 'Lusaka, Kabwata',
        installationType: 'new',
        preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'scheduled',
        technicianName: 'Mike Banda',
        scheduledTime: '10:00 AM',
        cost: 500,
    };
}

/**
 * Get DIY installation guide
 */
export function getDIYInstallationGuide(): string {
    return `🛠️ DIY Installation Guide

IMPORTANT: Basic installation only. For complex setups, book a technician.

What You Need:
✓ Satellite dish (60cm or larger)
✓ Decoder
✓ LNB (Low Noise Block)
✓ Coaxial cable (RG6)
✓ Cable connectors
✓ Mounting brackets & bolts
✓ Compass (or compass app)
✓ Spirit level
✓ Spanner set
✓ Cable clips

Step-by-Step Installation:

1️⃣ Choose Installation Location
   • Clear view of northern sky (in Zambia)
   • No trees, buildings, or obstacles
   • Stable wall or ground mount
   • Accessible for maintenance
   • Protected from strong winds

2️⃣ Mount the Satellite Dish
   • Use sturdy mounting brackets
   • Ensure wall is strong enough
   • Level the mount horizontally
   • Tighten bolts firmly
   • Leave some play for adjustment

3️⃣ Install the LNB
   • Attach LNB to dish arm
   • Point LNB "eye" toward dish
   • Connect coaxial cable
   • Secure cable with weather tape
   • Ensure connector is tight

4️⃣ Run the Cable
   • From dish to decoder location
   • Use cable clips every 50cm
   • Avoid sharp bends
   • Keep away from power cables
   • Protect outdoor cables from weather

5️⃣ Point the Dish
   📐 Settings for Lusaka, Zambia:
   • Azimuth: 55° (East-Southeast)
   • Elevation: 52-55°
   • Polarization: 0° (Vertical)

   How to Point:
   a) Set elevation angle using scale on dish
   b) Use compass to find 55° azimuth
   c) Point dish in that direction
   d) Connect decoder and check signal
   e) Fine-tune while watching signal meter

6️⃣ Connect the Decoder
   • Plug coaxial cable into LNB port
   • Connect HDMI/AV to TV
   • Insert smart card (chip facing up)
   • Plug in power cable
   • Turn on decoder

7️⃣ Scan for Channels
   • Menu > Settings > Installation
   • Select Satellite: IS-20 @ 68.5°E
   • LNB Type: Universal
   • LNB Frequency: 9750/10600
   • Start scan
   • Wait for channels to load

8️⃣ Optimize Signal
   • Menu > Check Signal
   • Aim for Strength > 70%
   • And Quality > 70%
   • Slowly adjust dish azimuth
   • Then fine-tune elevation
   • Tighten all bolts when optimal

9️⃣ Final Checks
   ✓ All cables secured
   ✓ Dish firmly mounted
   ✓ Signal strength good
   ✓ Channels loading
   ✓ Picture quality clear
   ✓ Remote control working

🔟 Activate Subscription
   • Note your decoder number
   • Purchase subscription package
   • Dial *XXX# or visit website
   • Wait 15 minutes for activation
   • Enjoy your TV!

Common Issues & Fixes:

❌ No Signal
→ Check all connections
→ Verify LNB cable not damaged
→ Ensure correct satellite settings
→ Realign dish carefully

❌ Poor Picture Quality
→ Improve signal strength (align dish)
→ Check cable quality
→ Ensure tight connections
→ Replace damaged LNB if needed

❌ Some Channels Missing
→ Rescan channels
→ Check subscription status
→ Verify correct satellite

❌ "E16" Error
→ Subscription not active
→ Purchase/renew package
→ Wait 15 mins for activation

⚠️ Safety Warnings:
• Beware of electrical lines when mounting
• Use stable ladder when working at height
• Don't install during rain or storms
• Wear safety equipment
• Get help for rooftop installations

Need professional help?
Reply 'book technician' to schedule installation

Estimated DIY Time: 2-4 hours
Professional Installation: K500 (includes optimization)`;
}

/**
 * Get installation checklist
 */
export function getInstallationChecklist(): string {
    return `📋 Installation Checklist

Before Technician Arrives:
□ Clear access to installation area
□ Remove obstacles from mounting location
□ Ensure someone 18+ will be home
□ Have decoder number ready
□ Decide on TV location
□ Check payment method ready

During Installation:
□ Verify technician ID badge
□ Show mounting preferences
□ Test all channels
□ Check signal strength (>70%)
□ Ensure remote works
□ Get decoder number noted
□ Ask questions if unsure

After Installation:
□ Decoder powered and working
□ All channels loading
□ Picture quality good
□ Remote control functional
□ Cables neatly organized
□ Received installation receipt
□ Know how to renew subscription
□ Technician contact saved

Installation Quality Checks:
✓ Dish firmly mounted (no wobble)
✓ LNB properly aligned
✓ Cables professionally routed
✓ No exposed cable connections
✓ Decoder ventilated properly
✓ Smart card inserted correctly

Issues? Report within 24 hours for free correction!`;
}

/**
 * Format installation request
 */
export function formatInstallationRequest(request: InstallationRequest): string {
    const statusEmojis = {
        pending: '⏳',
        scheduled: '📅',
        in_progress: '🔧',
        completed: '✅',
        cancelled: '❌',
    };

    return `${statusEmojis[request.status]} Installation Request

Request ID: ${request.id}
Type: ${request.installationType.toUpperCase()}
Status: ${request.status.toUpperCase()}

Customer: ${request.customerName}
Phone: ${request.phoneNumber}
Address: ${request.address}

${request.technicianName ? `Technician: ${request.technicianName}` : ''}
${request.scheduledTime ? `Scheduled: ${request.preferredDate} at ${request.scheduledTime}` : `Preferred Date: ${request.preferredDate}`}
${request.cost ? `Cost: K${request.cost}` : ''}

${request.status === 'scheduled' ? '\n📞 Technician will call 30 minutes before arrival' : ''}
${request.status === 'pending' ? '\n⏳ We will contact you within 2 hours to confirm' : ''}`;
}
