export function buildReflectionPrompt({ mission, consequence, twist, competencyName }) {
  return {
    prompt: `Qual criterio em ${competencyName || 'tomada de decisao'} se mostrou mais forte ou mais fragil depois da consequencia atual?`,
    debrief: `${mission?.title || 'A fase atual'} agora pede leitura de impacto sobre ${competencyName || 'a competencia central'}. ${consequence?.narrative || ''}`.trim(),
    mentorCue: twist
      ? `Considere como o twist ${twist.title || twist.kind} alterou as premissas da escolha.`
      : 'Considere o que voce manteria e o que ajustaria antes de repetir esta decisao.'
  };
}