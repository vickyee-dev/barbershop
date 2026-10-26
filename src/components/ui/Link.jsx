import { buttonClasses } from "./styles";

export default function Link({ to, button, variant, size, className = "", ...props }) {
  const cls = button ? buttonClasses({ variant, size, className }) : className;
  return <a href={`#${to}`} className={cls} {...props} />;
}
