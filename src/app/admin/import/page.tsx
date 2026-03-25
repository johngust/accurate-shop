import ImportDashboard from '@/components/admin/ImportDashboard';

export const runtime = "edge";

export default function ImportPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-serif text-white mb-8 uppercase tracking-tight">Импорт каталога</h1>
            <ImportDashboard />
        </div>
    );
}
