
// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useForm, Form } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Edit2, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

/**
 * Tipo retornado pela API de perfil de usuário
 */
type UserProfile = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  type: "contratante" | "prestador";
  profession?: string;
  created_at?: string;
};

export default function Profile() {
  const { user } = useAuth();
  const {toast} = useToast();
  const userId = user?.id;
  const [editMode, setEditMode] = useState(false);

  // Busca dados do perfil
  const { data, isLoading, isError, refetch } = useQuery<UserProfile>({
    queryKey: ["user", userId],
    queryFn: () => apiRequest("GET", `/users/${userId}`).then((r) => r.json()),
    enabled: !!userId,
    retry: false,
  });

  // Formulário para edição inline
  const form = useForm<UserProfile>({ defaultValues: data ?? undefined });
  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  // Mutation de atualização
  const mutation = useMutation({
    mutationFn: (values: UserProfile) =>
      apiRequest("PUT", `/users/${userId}`, values),
    onSuccess: async () => {
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas." });
      setEditMode(false);
      await refetch();
    },
    onError: (err: any) => {
      toast({ title: "Erro", description: err.message || "Tente novamente.", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-amber-600" />
      </div>
    );
  }
  if (isError || !data) {
    return <div className="text-center text-red-600 p-4">Erro ao carregar perfil.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-600">Meu Perfil</h1>
        <Button variant="outline" size="sm" onClick={() => setEditMode(!editMode)}>
          {editMode ? <X className="mr-1 h-4 w-4" /> : <Edit2 className="mr-1 h-4 w-4" />}
          {editMode ? 'Cancelar' : 'Editar Perfil'}
        </Button>
      </div>

      {!editMode ? (
        <Card className="shadow-lg rounded-lg">
          <CardContent>
            <InfoRow label="Nome" value={data.name} />
            <InfoRow label="E-mail" value={data.email} />
            <InfoRow label="CPF" value={data.cpf} />
            <InfoRow label="Tipo" value={data.type === 'prestador' ? 'Prestador' : 'Contratante'} />
            {data.type === 'prestador' && data.profession && (
              <InfoRow label="Profissão" value={data.profession} />
            )}
            {data.created_at && (
              <InfoRow
                label="Registrado em"
                value={format(parseISO(data.created_at), 'dd/MM/yyyy HH:mm')}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg rounded-lg">
          <CardContent>
            <form onSubmit={form.handleSubmit((vals) => mutation.mutate(vals))} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="cpf" render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conta</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full border p-2 rounded">
                      <option value="contratante">Contratante</option>
                      <option value="prestador">Prestador</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {form.watch('type') === 'prestador' && (
                <FormField control={form.control} name="profession" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profissão</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              <div className="pt-4">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

