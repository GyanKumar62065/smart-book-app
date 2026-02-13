"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AuthListener() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN") {
                router.push("/dashboard");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, router]);

    return null;
}
