// import { Organization, OrganizationType } from "../types/organization";

// import { User } from "../types/user";
// import create from "zustand";

// interface AppState {
//   user?: User;
//   organization?: Organization;
//   setUserAndOrganization: ({
//     user,
//     organization,
//   }: {
//     user: User;
//     organization?: Organization;
//   }) => void;
//   clearUserAndOrganization: () => void;
// }

// // Zustand store
// const initialState = {
//   user: undefined,
//   organization: undefined,
// };

// export const useAppState = create<AppState>((set) => ({
//   // state
//   ...initialState,

//   // functions
//   setUserAndOrganization: ({
//     user,
//     organization,
//   }: {
//     user?: User;
//     organization?: Organization;
//   }) => set(() => ({ user, organization })),
//   clearUserAndOrganization: () =>
//     set(() => ({
//       user: undefined,
//       organization: undefined,
//     })),
// }));
