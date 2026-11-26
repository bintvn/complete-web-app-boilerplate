import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { useState } from "react";

export default function MyButton() {
  const [count, setCount] = useState(0);

  return (
    <Button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
      Count is {count}
    </Button>
  );
}
