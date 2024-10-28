// import { React, createContext, useState } from "react";

// const userContext = createContext(null);
// export const Provider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<{
//     name: string;
//     email: string;
//     password: string;
//   } | null>(null);

//   const [skills, setSkills] = useState<
//     | {
//         id: number;
//         name: string;
//         questions:
//           | {
//               id: number;
//               question: string;
//               options: string[];
//             }[]
//           | null;

//       }[]
//     | null
//   >(null);

//   return <userContext.Provider value={}>{children}</userContext.Provider>;
// };
