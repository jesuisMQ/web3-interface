import Header from "./Header";
import NavBar from "./navBar";
import Footer from "./Footer";

export default function Layout({ children }: any) {
  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/1764319081546-BACKCOSMO2.jpg')",
      }}
    >
      <Header />
      <NavBar />

      {children}

      <div className="p-6">
        <appkit-button />
      </div>
      <Footer/>
    </main>
  );
}