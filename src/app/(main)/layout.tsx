import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}
