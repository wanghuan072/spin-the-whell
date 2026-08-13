import dynamic from "next/dynamic";

const AdminPage = dynamic(() => import("@/page/admin/AdminPage").then((module) => module.AdminPage));

export default function Page() {
  return <AdminPage />;
}
