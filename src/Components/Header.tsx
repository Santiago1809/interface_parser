export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 flex items-center justify-center w-full mx-auto mt-2">
      <nav className="flex px-3 text-sm font-medium rounded-full text-gray-600 dark:text-gray-200 justify-center items-center">
        <h1 className="text-4xl mb-4">Json to Class</h1>
      </nav>
    </header>
  );
}
