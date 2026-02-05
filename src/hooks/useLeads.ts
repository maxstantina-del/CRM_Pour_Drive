/**
 * ✨ REFACTORISÉ - Hook de gestion des leads
 * Gère UNIQUEMENT les leads, séparé de la gestion des pipelines
 * Source de vérité: Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';

export function useLeads() {
  const isSupabase = isSupabaseConfigured();

  // Leads organisés par pipeline
  const [leadsByPipeline, setLeadsByPipeline] = useState<Record<string, Lead[]>>({});

  // Fonction de chargement des leads depuis Supabase
  const loadLeads = useCallback(async () => {
    if (!isSupabase || !supabase) return;

    try {
      console.log('🔵 Loading leads from Supabase...');
      // ✅ FIX: Augmenter la limite à 10000 leads (défaut Supabase = 1000)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10000);  // Support jusqu'à 10k leads

      if (error) throw error;

      if (data) {
        const leadsMap: Record<string, Lead[]> = {};
        data.forEach(l => {
          const lead: Lead = {
            id: l.id,
            name: l.name,
            email: l.email,
            phone: l.phone,
            company: l.company,
            address: l.address,
            city: l.city,
            zipCode: l.zip_code,
            country: l.country,
            stage: l.stage,
            value: l.value,
            probability: l.probability,
            closedDate: l.closed_date,
            notes: l.notes,
            nextActions: l.next_actions || [],
            createdAt: l.created_at,
            updatedAt: l.updated_at,
            pipelineId: l.pipeline_id
          };
          const pipelineId = lead.pipelineId || 'default';
          if (!leadsMap[pipelineId]) leadsMap[pipelineId] = [];
          leadsMap[pipelineId].push(lead);
        });
        setLeadsByPipeline(leadsMap);
        console.log('✅ Leads loaded:', Object.keys(leadsMap).reduce((sum, k) => sum + leadsMap[k].length, 0), 'total');
      }
    } catch (error) {
      console.error('❌ Error loading leads:', error);
    }
  }, [isSupabase]);

  // Charger les leads au démarrage
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Récupérer les leads d'un pipeline
  const getPipelineLeads = useCallback((pipelineId: string): Lead[] => {
    return leadsByPipeline[pipelineId] || [];
  }, [leadsByPipeline]);

  // Ajouter un lead
  const addLead = useCallback(async (pipelineId: string, lead: Lead) => {
    setLeadsByPipeline(prev => ({
      ...prev,
      [pipelineId]: [...(prev[pipelineId] || []), lead]
    }));

    if (isSupabase && supabase) {
      try {
        await supabase.from('leads').insert({
          id: lead.id, name: lead.name, email: lead.email, phone: lead.phone,
          company: lead.company, address: lead.address, city: lead.city,
          zip_code: lead.zipCode, country: lead.country, stage: lead.stage,
          value: lead.value, probability: lead.probability, closed_date: lead.closedDate,
          notes: lead.notes, next_actions: lead.nextActions, created_at: lead.createdAt,
          updated_at: lead.updatedAt, pipeline_id: lead.pipelineId
        });
      } catch (error) {
        console.error('❌ Error adding lead:', error);
        setLeadsByPipeline(prev => ({
          ...prev,
          [pipelineId]: prev[pipelineId].filter(l => l.id !== lead.id)
        }));
        throw error;
      }
    }
  }, [isSupabase]);

  // Mettre à jour un lead
  const updateLead = useCallback(async (pipelineId: string, leadId: string, updates: Partial<Lead>) => {
    setLeadsByPipeline(prev => ({
      ...prev,
      [pipelineId]: prev[pipelineId]?.map(l =>
        l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ) || []
    }));

    if (isSupabase && supabase) {
      try {
        const supabaseUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) supabaseUpdates.name = updates.name;
        if (updates.email !== undefined) supabaseUpdates.email = updates.email;
        if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
        if (updates.company !== undefined) supabaseUpdates.company = updates.company;
        if (updates.address !== undefined) supabaseUpdates.address = updates.address;
        if (updates.city !== undefined) supabaseUpdates.city = updates.city;
        if (updates.zipCode !== undefined) supabaseUpdates.zip_code = updates.zipCode;
        if (updates.country !== undefined) supabaseUpdates.country = updates.country;
        if (updates.stage !== undefined) supabaseUpdates.stage = updates.stage;
        if (updates.value !== undefined) supabaseUpdates.value = updates.value;
        if (updates.probability !== undefined) supabaseUpdates.probability = updates.probability;
        if (updates.closedDate !== undefined) supabaseUpdates.closed_date = updates.closedDate;
        if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
        if (updates.nextActions !== undefined) supabaseUpdates.next_actions = updates.nextActions;

        await supabase.from('leads').update(supabaseUpdates).eq('id', leadId);
      } catch (error) {
        console.error('❌ Error updating lead:', error);
        throw error;
      }
    }
  }, [isSupabase]);

  // Supprimer un lead
  const deleteLead = useCallback(async (pipelineId: string, leadId: string) => {
    setLeadsByPipeline(prev => ({
      ...prev,
      [pipelineId]: prev[pipelineId]?.filter(l => l.id !== leadId) || []
    }));

    if (isSupabase && supabase) {
      try {
        await supabase.from('leads').delete().eq('id', leadId);
      } catch (error) {
        console.error('❌ Error deleting lead:', error);
        throw error;
      }
    }
  }, [isSupabase]);

  // Import batch de leads
  const addBatchLeads = useCallback(async (pipelineId: string, leads: Lead[]) => {
    console.log('🔵 addBatchLeads called with pipelineId:', pipelineId);
    console.log('🔵 addBatchLeads: Number of leads:', leads.length);
    console.log('🔵 Sample lead pipelineId:', leads[0]?.pipelineId);

    // ✅ Vérifier que le pipelineId n'est pas vide
    if (!pipelineId) {
      console.error('❌ addBatchLeads: pipelineId is empty!');
      throw new Error('pipelineId cannot be empty');
    }

    setLeadsByPipeline(prev => ({
      ...prev,
      [pipelineId]: [...(prev[pipelineId] || []), ...leads]
    }));

    if (isSupabase && supabase) {
      try {
        const supabaseLeads = leads.map(lead => ({
          id: lead.id, name: lead.name, email: lead.email, phone: lead.phone,
          company: lead.company, address: lead.address, city: lead.city,
          zip_code: lead.zipCode, country: lead.country, stage: lead.stage,
          value: lead.value, probability: lead.probability, closed_date: lead.closedDate,
          notes: lead.notes, next_actions: lead.nextActions, created_at: lead.createdAt,
          updated_at: lead.updatedAt, pipeline_id: pipelineId  // ✅ Utilise le PARAMÈTRE pipelineId, pas lead.pipelineId
        }));
        console.log('🟢 Inserting to Supabase with pipeline_id:', pipelineId);
        await supabase.from('leads').insert(supabaseLeads);
        console.log('✅ Batch import OK');
      } catch (error) {
        console.error('❌ Error batch import:', error);
        setLeadsByPipeline(prev => ({
          ...prev,
          [pipelineId]: prev[pipelineId].filter(l => !leads.find(nl => nl.id === l.id))
        }));
        throw error;
      }
    }
  }, [isSupabase]);

  // Supprimer tous les leads d'un pipeline
  const deletePipelineLeads = useCallback(async (pipelineId: string) => {
    setLeadsByPipeline(prev => {
      const { [pipelineId]: _, ...rest } = prev;
      return rest;
    });

    if (isSupabase && supabase) {
      try {
        await supabase.from('leads').delete().eq('pipeline_id', pipelineId);
      } catch (error) {
        console.error('❌ Error deleting pipeline leads:', error);
      }
    }
  }, [isSupabase]);

  return {
    leadsByPipeline,
    getPipelineLeads,
    addLead,
    updateLead,
    deleteLead,
    addBatchLeads,
    deletePipelineLeads,
    reloadLeads: loadLeads  // ✅ Expose la fonction de rechargement
  };
}
