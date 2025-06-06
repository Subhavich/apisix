import ApiKeyGenerator from "../components/APIKeygen";
import Overview from "../components/Overview";

export default function Home() {
  return (
    <>
      <div className="flex md:flex-row sm:justify-between flex-col">
        <Overview />
        <ApiKeyGenerator />
      </div>
    </>
  );
}
