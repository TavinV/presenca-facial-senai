import { useState } from "react";
import Layout from "../components/layout/Layout";
import AccessRequestForm from "../components/forms/AccessRequestForm";
import useAccessRequests from "../hooks/useAccessRequests";

export default function AccessRequestPage() {
  const { create } = useAccessRequests();
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (payload) => {
    const res = await create(payload);
    if (res?.success) setSuccess(res.data._id || res.data.id);
    return res;
  };

  return (
    <Layout>
      <div className="mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Solicitar Acesso</h1>
        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            Solicitação enviada com sucesso. ID: <strong>{success}</strong>
          </div>
        ) : (
          <AccessRequestForm onSubmit={handleSubmit} />
        )}
      </div>
    </Layout>
  );
}
