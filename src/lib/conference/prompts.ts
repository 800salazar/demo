/** Copyable conference resources. No model, API calls or student data storage. */
export const businessAuditPrompt = `Actúa como un Venture Partner y Director Financiero (CFO) enfocado en startups en etapa temprana. Revisa con rigor analítico los documentos que acabo de adjuntar sobre mi proyecto.

Mi objetivo es detectar incoherencias financieras y puntos ciegos operativos antes de gastar más dinero. Soy estudiante y necesito explicaciones claras y acciones que pueda ejecutar.

Analiza los archivos adjuntos y entrégame:

1. Auditoría financiera y costos por venta:
- Revisa mis costos y márgenes. ¿Estoy omitiendo comisiones de pago, mermas, empaque, envíos, costo de conseguir clientes o impuestos?
- Calcula o evalúa mi punto de equilibrio: cuántas unidades necesito vender al mes para no perder dinero. Dime si es realista para un estudiante que opera solo o con un socio.
- Muestra las fórmulas y distingue margen sobre el precio de venta de aumento sobre el costo.

2. Prueba de estrés del modelo de negocio:
- Señala los 3 supuestos más frágiles de mi propuesta: lo que, si sale mal, pondría en riesgo el negocio.
- Evalúa la relación entre mi precio y el valor que recibe el cliente. Indica qué evidencia falta para saber si el precio es adecuado.

3. Ajustes y acciones inmediatas:
- Propón 3 ajustes directos a mis números o proceso para proteger mi margen desde el día uno.
- Define las 2 prioridades que debo ejecutar en los próximos 7 días para validar los puntos más riesgosos.

Responde en español sencillo. Explica cualquier término técnico en una frase. No inventes datos faltantes: pregunta lo indispensable antes de calcular. Separa los datos de mis documentos, tus cálculos y las estimaciones. Si un costo o impuesto depende de mi ubicación o situación, indícalo. Cierra con una lista breve de qué hacer primero.`;

export interface BusinessIdea {
  product: string;
  location: string;
  budget: string;
}

export function buildBusinessIdeaPrompt({ product, location, budget }: BusinessIdea): string {
  return `Actúa como un director de operaciones y cofundador pragmático, experto en arrancar negocios desde cero con presupuestos mínimos.

Tengo una idea, pero aún no tengo números, proveedores ni estructura. Soy estudiante. Ayúdame a aterrizarla de la manera más rápida y barata posible.

Mis datos iniciales:
- Lo que quiero vender: ${product.trim() || "[Escribe qué quieres vender]"}
- Ciudad o entorno donde quiero empezar: ${location.trim() || "[Escribe tu ciudad o zona]"}
- Dinero máximo que puedo invertir hoy: ${budget.trim() || "[Escribe tu presupuesto en MXN]"}

Con esto, desarrolla la estructura base del negocio:

1. Costos y ganancia por venta:
- Estima los costos unitarios típicos e indica qué incluyen y qué falta confirmar con una cotización.
- Sugiere el margen bruto que debería buscar, en porcentaje y en dinero por unidad. Explica la diferencia entre margen y aumento sobre el costo.

2. Proveedores y una primera versión sencilla:
- Dime qué tipo de proveedores buscar en mi localidad y qué preguntas hacerles para conseguir precio de mayoreo, conocer mínimos de compra y evitar gastos innecesarios.
- Propón la versión más sencilla del producto o servicio que puedo ofrecer sin comprar mucho inventario ni superar mi presupuesto.

3. Mis primeros compradores:
- Elige un grupo pequeño de personas de mi entorno al que pueda vender primero: compañeros, profesores, vecinos, gimnasios u otro grupo concreto. Explica por qué empezar ahí sin pagar publicidad masiva.

4. Plan de 5 pasos para intentar mi primera venta:
- Organiza un plan de lunes a viernes con una acción concreta por día, su costo y el resultado que debo comprobar.
- Mantén el gasto total dentro del presupuesto que indiqué. Si es cero, plantea una validación sin gasto inicial. No prometas que habrá una venta.

Responde en español sencillo y explica cualquier término técnico. Separa estimaciones de precios verificados. No inventes proveedores, precios actuales ni contactos. Si puedes consultar fuentes actuales, incluye enlaces y fecha; si no, dime qué buscar y cómo pedir una cotización. Si faltan datos indispensables, haz hasta 3 preguntas breves antes de continuar. Termina diciéndome la primera acción que puedo hacer hoy.`;
}
