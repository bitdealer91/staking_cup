"use client";

import { ReactNode } from "react";
import { Drawer } from "vaul";
import AppProfileCard from "./app-profile-card";

interface AppProfileDrawerProps {
  trigger: ReactNode;
  name: string;
  description: string;
  avatarUrl: string;
  coverUrl?: string;
  xUrl?: string;
  discordUrl?: string;
  appUrl?: string;
  telegramUrl?: string;
  open: boolean;
  deployed: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppProfileDrawer({
  trigger,
  name,
  description,
  avatarUrl,
  coverUrl,
  xUrl,
  discordUrl,
  appUrl,
  deployed,
  telegramUrl,
  open,
  onOpenChange,
}: AppProfileDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center">
          <Drawer.Content className="pointer-events-auto h-fit max-h-[80vh] w-full overflow-hidden bg-transparent outline-none md:max-w-[400px]">
            <div className="flex justify-center p-0">
              <div className="mb-4 h-1 w-10 rounded-full bg-somnia-color-background-primary-03" />
            </div>
            <div className="flex justify-center p-0">
              <AppProfileCard
                className="w-full rounded-b-none"
                name={name}
                description={description}
                avatarUrl={avatarUrl}
                coverUrl={coverUrl!}
                xUrl={xUrl}
                discordUrl={discordUrl}
                appUrl={appUrl!}
                telegramUrl={telegramUrl}
                deployed={deployed}
              />
            </div>
          </Drawer.Content>
        </div>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
