import { get, post } from "./index";
interface IUser {
  name: string;
}
export function getUser() {
  return get<IUser>("/user", {});
}
