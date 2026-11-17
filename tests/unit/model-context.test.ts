import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/demo/seed";
import { buildOperationalAnalysis, getOperationalSnapshot, getCalculatedFallback } from "@/lib/ai/analysis";
import { compactModelContext, parseNemotronResponse } from "@/lib/ai/model-context";
import { emptyOrderDraft } from "@/lib/ai/order-draft";
import { initialSuggestions } from "@/lib/ai/suggestions";
const analysis=buildOperationalAnalysis(getOperationalSnapshot(createSeedData(new Date('2026-11-16T18:00:00Z'))),new Date('2026-11-16T18:00:00Z'));
describe('compact context and free Nemotron compatibility',()=>{
  it('keeps full totals but bounds relevant details without randomly sampling or mutating the snapshot',()=>{
    const context=compactModelContext(analysis,'Analiza costos de Mantenimiento');
    expect(context.totals).toEqual(analysis.totals);
    expect(context.orders).toHaveLength(8);
    expect(context.orders.every(o=>o.department==='Mantenimiento')).toBe(true);
    expect(context.scope.partialDetails).toBe(true);
    expect(context).not.toHaveProperty('activity');
    expect(JSON.stringify(context).length).toBeLessThan(JSON.stringify(analysis).length*0.65);
    expect(analysis.orders).toHaveLength(30);
  });
  it('preserves complete evidence for a requested folio, even outside the first eight orders',()=>{
    const context=compactModelContext(analysis,'Revisa OT-1029');
    expect(context.orders).toHaveLength(1);
    expect(context.orders[0].folio).toBe('OT-1029');
    expect(context.orders[0]).toHaveProperty('description');
    expect(compactModelContext(analysis,'Analiza actividad del 2026-11-16')).toHaveProperty('activity');
    expect(compactModelContext(analysis,'Lista todas las órdenes').orders).toHaveLength(30);
  });
  it('removes unrelated order details during drafting and explicitly marks missing folios',()=>{
    const context=compactModelContext(analysis,'Prepara una nueva solicitud para revisar sensor');
    expect(context.orders).toHaveLength(0); expect(context.scope.task).toBe('draft');
    expect(context.totals).toEqual(analysis.totals);
    expect(compactModelContext(analysis,'Revisa OT-9999').scope.notFoundFolios).toEqual(['OT-9999']);
  });
  it('merges only the supplied correction and preserves dates, assignees and budgets of zero',()=>{
    const current={...emptyOrderDraft(),title:'Revisar sensor',assignee:'Ana Torres',dueDate:'2026-12-20',estimatedCost:1500};
    const result=parseNemotronResponse({answer:'Presupuesto corregido',draft:{estimatedCost:0},suggestions:initialSuggestions},current,'Cambia solo el presupuesto a cero');
    expect(result.draft).toEqual({...current,estimatedCost:0});
    expect(current.estimatedCost).toBe(1500);
  });
  it('starts fresh when explicitly requested and rejects unrecognized writable fields',()=>{
    const current={...emptyOrderDraft(),assignee:'Ana Torres',dueDate:'2026-12-20'};
    const response={answer:'Nuevo borrador',draft:{title:'Revisar compresor'},suggestions:initialSuggestions};
    expect(parseNemotronResponse(response,current,'Prepara una nueva solicitud').draft).toEqual({...emptyOrderDraft(),title:'Revisar compresor'});
    expect(()=>parseNemotronResponse({...response,draft:{statusId:'completed'}},current,'Completa el borrador')).toThrow();
  });
  it('keeps fallback costs and cited overruns scoped to the named area',()=>{
    const response=getCalculatedFallback('Costos de Mantenimiento',analysis);
    expect(response).toContain('Mantenimiento'); expect(response).toContain('13,000.00');
    expect(response).toContain('OT-1002'); expect(response).toContain('OT-1004');
    expect(response).not.toContain('OT-1016'); expect(response).not.toContain('OT-1023');
  });
});
