import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@complete-web-app-boilerplate/ui/components/input-otp";

type InputOTPWithSeparatorProps = Omit<
  React.ComponentProps<typeof InputOTP>,
  "maxLength" | "children" | "render"
>;

export function InputOTPWithSeparator(props: InputOTPWithSeparatorProps) {
  return (
    <InputOTP {...props} maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

