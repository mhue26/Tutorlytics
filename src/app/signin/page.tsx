import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default async function SignInPage() {
    const session = await getServerSession(authOptions);
    if (session?.user) redirect("/dashboard");
    return (
        <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#EFFAFF' }}>
            <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                    <div className="text-[#3D4756]">Loading...</div>
                </div>
            }>
                <SignInForm />
            </Suspense>
        </div>
    );
}


