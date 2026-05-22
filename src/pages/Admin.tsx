import Candidates from "../components/Candidates";

export default function Admin() {
  return (
    <div className="max-w-[1366px] mx-auto p-6">

      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <appkit-button />
      </div>

      <div className="mt-8" />

      <Candidates isAdmin={true} />

    </div>
  );
}