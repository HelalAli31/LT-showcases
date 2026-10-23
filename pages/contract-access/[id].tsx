import dynamic from "next/dynamic";
const Customer = dynamic(() => import("@/private/Customer"), { ssr: false });
export default Customer;
