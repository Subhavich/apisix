import ApiKeyGenerator from "../components/APIKeygen";
import Overview from "../components/Overview";

export default function Home() {
  return (
    <>
      <h1>Home Page</h1>
      <Overview />
      <ApiKeyGenerator />
    </>
  );
}
