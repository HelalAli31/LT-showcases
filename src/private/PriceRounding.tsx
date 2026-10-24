import { money } from "./shared";

export const priceEndingIn9 = (agorot: number) =>
  (Math.ceil((Math.ceil(agorot / 100) - 9) / 10) * 10 + 9) * 100;

export default function PriceRounding({
  setup,
  monthly,
  onChange,
}: {
  setup: number;
  monthly: number;
  onChange: (setup: number, monthly: number) => void;
}) {
  const nextSetup = priceEndingIn9(setup);
  const nextMonthly = priceEndingIn9(monthly);
  return (
    <button
      type="button"
      className="secondary"
      disabled={setup === nextSetup && monthly === nextMonthly}
      onClick={() => onChange(nextSetup, nextMonthly)}
    >
      עיגול מחירים למעלה לסיומת 9 — הקמה {money(nextSetup)}, חודשי{" "}
      {money(nextMonthly)}
    </button>
  );
}
