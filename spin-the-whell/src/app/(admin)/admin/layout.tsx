import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/style/page/admin/admin.css";

export const metadata: Metadata = {
  title: { absolute: "Comment Administration" },
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AntdRegistry>
      <div className="admin-root">{children}</div>
    </AntdRegistry>
  );
}
