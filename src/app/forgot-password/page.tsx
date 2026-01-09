import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage() {
    const session = await getServerSession(authOptions);
    if (session?.user) redirect("/students");
    return (
        <div className="fixed inset-0 overflow-hidden" style={{ backgroundColor: '#EFFAFF' }}>
            <Suspense fallback={
                <div className="h-full flex items-center justify-center">
                    <div className="text-[#3D4756]">Loading...</div>
                </div>
            }>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    );
}

