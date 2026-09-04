import dynamic from 'next/dynamic';

const Studio = dynamic(() => import('../components/Studio'), { ssr: false, loading: () => <div className="boot-loader">Preparing the studio…</div> });
export default function Home() { return <Studio />; }
