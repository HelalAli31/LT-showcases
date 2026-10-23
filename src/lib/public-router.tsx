import NextLink from "next/link";
import { useRouter } from "next/router";
import { forwardRef, AnchorHTMLAttributes } from "react";
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
};
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, ...props },
  ref,
) {
  return <NextLink href={to} ref={ref} {...props} />;
});
type NavProps = Omit<LinkProps, "className"> & {
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
};
export function NavLink({ to, end, className, ...props }: NavProps) {
  const router = useRouter(),
    path = router.asPath.split("?")[0];
  const isActive = end ? path === to : path === to || path.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={
        typeof className === "function" ? className({ isActive }) : className
      }
      aria-current={isActive ? "page" : undefined}
      {...props}
    />
  );
}
export function useNavigate() {
  const router = useRouter();
  return (path: string) => router.push(path);
}
export function useLocation() {
  const router = useRouter();
  return { pathname: router.asPath.split("?")[0] };
}
export function useParams() {
  const router = useRouter();
  return Object.fromEntries(
    Object.entries(router.query).map(([k, v]) => [
      k,
      Array.isArray(v) ? v[0] : v,
    ]),
  ) as Record<string, string>;
}
