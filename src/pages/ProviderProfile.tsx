
// src/pages/ProviderProfile.tsx
import React from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// define exatamente o shape de cada provider como a API devolve
export interface ProviderApi {
  provider_id: number;
  user_id: number;
  profession: string;
  views_profile: number;
  about: string | null;
  rating_mid: string;
  created_at: string;
  updated_at: string;
}

// shape do envelope completo
interface ProvidersResponse {
  code: number;
  providers: ProviderApi[];
  message: string;
  success: boolean;
}

export default function ProviderProfile() {
  const [match, params] = useRoute("/providers/:id");
  const id = params?.id;

  // agora a query retorna já o array <ProviderApi[]> diretamente
  const { data: providers, isLoading, isError } = useQuery<ProviderApi[]>({
    queryKey: [`/providers/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/providers/${id}`);
      const json = (await res.json()) as ProvidersResponse;
      return json.providers;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-6 text-center">Carregando perfil…</div>;
  }
  if (isError || !providers || providers.length === 0) {
    return (
      <div className="p-6 text-center text-red-500">
        Erro ao carregar perfil.
      </div>
    );
  }

  // pega o primeiro (único) provider
  const provider = providers[0];

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {provider.profession || "—"}
      </h1>
      <p className="text-gray-700">
        {provider.about ?? "Sem descrição."}
      </p>

      <div className="flex items-center space-x-4">
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
          {provider.rating_mid} ★
        </span>
        <span className="text-sm text-gray-500">
          Visto {provider.views_profile}×
        </span>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Detalhes</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>ID do provider: {provider.provider_id}</li>
          <li>Usuário: {provider.user_id}</li>
          <li>
            Criado em:{" "}
            {new Date(provider.created_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </li>
        </ul>
      </div>
    </div>
  );
}

