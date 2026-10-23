import dynamic from "next/dynamic";
const Offer = dynamic(() => import("@/private/Customer"), { ssr: false });
export default Offer;
