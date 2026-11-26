import { render } from "@react-email/render";
import { createElement, type ComponentType } from "react";

export { render };
export { VerificationCodeEmail } from "../emails/VerificationCodeEmail.js";

export function renderEmail<Props extends object>(
  template: ComponentType<Props>,
  props: NoInfer<Props>,
): Promise<string> {
  return render(createElement(template, props));
}
