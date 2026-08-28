import { ReactNode } from "react";

type ProjectsLayoutProps = {
  children: ReactNode;
};

export default function ProjectsLayoutProps({ children }: ProjectsLayoutProps) {
  return <div className="mx-auto max-w-4xl px-6 pt-12 pb-20">{children}</div>;
}
