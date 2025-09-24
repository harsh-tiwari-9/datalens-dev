// import '@/globals.css';
import Navbar04Page from "@/components/navbar-04/navbar-04"

export default function WithNavbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="min-h-svh">
        <Navbar04Page />
          <main className="mx-auto max-w-7xl px-4 py-28">
            {children}
        </main>
      </div>
      {/* <main>{children}</main> */}
    </>
  );
}