export default class Role {
    static roleToPath: any = {
      "Superadmin": "/dashboard",
      "Admin": "/dashboard",
      "Brand": "/brand/dashboard",
      "Ginner": "/ginner/dashboard",
      "Spinner": "/spinner/dashboard",
      "Knitter": "/knitter/dashboard",
      "Weaver": "/weaver/dashboard",
      "Garment": "/garment/dashboard",
      "Fabric":"/fabric/dashboard",
      "Developer": "/dashboard",
    };

    static exists(role: any) {
        if(!role) return false
        if (typeof role == "string") {
          if (this.roleToPath[role] !== undefined) return true;
          return false;
        } else {
          return false;
        }
      }
  
    static dashboardPath(role: any) {
      if( !role ) return null;
      if (!this.exists(role)) return null;
      
      return this.roleToPath[role];
    }
  }