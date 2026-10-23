import dynamic from "next/dynamic";
const Admin = dynamic(() => import("@/private/Admin"), { ssr: false });
export default Admin;
