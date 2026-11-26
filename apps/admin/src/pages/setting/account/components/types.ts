import type { UserDTO } from "@/types/dtos";

export type AccountCardBaseProps = {
  user: UserDTO;
  onUserChange: (nextUser: UserDTO) => void;
};
