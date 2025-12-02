import SignUpForm from '@/components/auth/SignUpForm';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">AirBrain</h1>
                <p className="text-gray-600">AI-Powered Customer Service Platform</p>
            </div>
            <SignUpForm />
        </div>
    );
}
