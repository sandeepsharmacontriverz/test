import API, { Res } from "./Api";
import Route from "./Route";

export default class User {
  static accessToken = "";
  static currentRole: any = null;
  static isAdmin: boolean = false;
  static email: string | "";
  static username: string | "";
  static id: Number | null;
  static type: any;
  static ginnerId: Number | null;
  static spinnerId: Number | null;
  static knitterId: Number | null;
  static garmentId: Number | null;
  static weaverId: Number | null;
  static brandId: Number | null;
  static fabricId: Number | null;
  static privileges: Array<any> = [];

  static async signOut(redirect = 1) {
    await API.get(["auth", "signout"]);
    this.accessToken = "";
    localStorage.clear();
    // localStorage.removeItem("accessToken")
    sessionStorage.removeItem("User");
    this.currentRole = null;
    if (redirect) window.location.href = "/auth/login";
  }

  static async role() {
    let res = await API.get(["user", "my-details"]);

    if (res.success) {
      this.currentRole = res.data?.user?.role;
      this.id = res.data?.user?.id;
      this.email = res.data?.user?.email;
      this.username = res.data?.user?.username;
      this.type = res.data?.role?.user_role;
      this.privileges = res.data?.privileges;
      this.ginnerId = res.data?.ginner?.id;
      this.spinnerId = res.data?.spinner?.id;
      this.knitterId = res.data?.knitter?.id;
      this.garmentId = res.data?.garment?.id;
      this.weaverId = res.data?.weaver?.id;
      this.brandId = res.data?.brand?.id;
      this.fabricId = res.data?.fabric?.id;
      return res.data;
    }
    // return "FREE";
  }
}
