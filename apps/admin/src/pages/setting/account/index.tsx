"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DeleteAccountCard,
  EmailCard,
  PasswordCard,
  PersonalInfoCard,
} from "./components";
import PageContainer from "../../../components/page-container";
import PageContent from "../../../components/page-content";
import PageHeader from "../../../components/page-header";
import type { UserDTO } from "@/types/dtos";

export default function AccountSettings() {
  const { user: authenticatedUser } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(authenticatedUser);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(authenticatedUser);
  }, [authenticatedUser]);

  if (!user) {
    return null;
  }

  return (
    <PageContainer>
      <PageHeader title="Pengaturan Akun" />

      <PageContent className="px-4 lg:px-6 grid gap-6 lg:grid-cols-2">
        <PersonalInfoCard user={user} onUserChange={setUser} />
        <PasswordCard />
        <EmailCard user={user} onUserChange={setUser} />
        <DeleteAccountCard />
      </PageContent>
    </PageContainer>
  );
}
