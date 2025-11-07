import { redirect } from 'next/navigation';

export default function Page() {
  // Root goes to static landing; landing itself links into the new app
  redirect('/landing/index.html');
}


