import { XMLParser } from 'fast-xml-parser';
import type { SimulationState, SimulationVariable, OdePage, CodePage, ViewElement, VarType } from '../types/simulation';

let idCounter = 0;
const uid = () => `parse_${Date.now()}_${++idCounter}`;

function cdata(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'object' && '__cdata' in (v as object)) return String((v as Record<string, unknown>)['__cdata']);
  return String(v);
}

function toArr<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export function parseEjssXML(xmlString: string): SimulationState {
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    isArray: (_name, jpath) => {
      const jp = String(jpath);
      return [
        'Osejs.Osejs.Model.Variables.Page',
        'Osejs.Osejs.Model.Evolution.Page',
        'Osejs.Osejs.Model.Constraints.Page',
        'Osejs.Osejs.Model.Initialization.Page',
        'Osejs.Osejs.HtmlView.Page',
      ].some((p) => jp.endsWith(p));
    },
  });

  const doc = parser.parse(xmlString);
  const root = doc?.Osejs ?? {};

  const info = root['Osejs.Information'] ?? {};
  const model = root['Osejs.Model'] ?? {};
  const htmlView = root['Osejs.HtmlView'] ?? {};

  // --- Variables ---
  const variables: SimulationVariable[] = [];
  const varPages = toArr(model['Osejs.Model.Variables']?.['Osejs.Model.Variables.Page']);
  for (const page of varPages) {
    const pageName = cdata(page?.Name) || 'Variables';
    const content = page?.Content ?? {};
    const vars = toArr(content?.Variable);
    for (const v of vars) {
      variables.push({
        id: uid(),
        name: cdata(v?.Name),
        value: cdata(v?.Value),
        type: (cdata(v?.Type) || 'double') as VarType,
        comment: cdata(v?.Comment),
        page: pageName,
        scope: 'global',
      });
    }
  }

  // --- ODE Pages ---
  const odePages: OdePage[] = [];
  const evoPages = toArr(model['Osejs.Model.Evolution']?.['Osejs.Model.Evolution.Page']);
  for (const page of evoPages) {
    const content = page?.Content ?? {};
    const rateNodes = toArr(content?.Rate);
    odePages.push({
      id: uid(),
      name: cdata(page?.Name) || 'Equations',
      rates: rateNodes.map((r) => ({
        state: r?.['@_state'] ?? '',
        expression: cdata(r),
      })),
      method: (cdata(content?.Method) || 'RungeKutta') as OdePage['method'],
      increment: cdata(content?.Increment) || 'dt',
      comment: cdata(content?.Comment),
    });
  }

  // --- Constraint Pages ---
  const constraintPages: CodePage[] = [];
  const conPages = toArr(model['Osejs.Model.Constraints']?.['Osejs.Model.Constraints.Page']);
  for (const page of conPages) {
    const content = page?.Content ?? {};
    constraintPages.push({
      id: uid(),
      name: cdata(page?.Name) || 'Constraints',
      code: cdata(content?.Code),
      comment: cdata(content?.Comment),
    });
  }

  // --- Init Pages ---
  const initPages: CodePage[] = [];
  const iniPages = toArr(model['Osejs.Model.Initialization']?.['Osejs.Model.Initialization.Page']);
  for (const page of iniPages) {
    const content = page?.Content ?? {};
    initPages.push({
      id: uid(),
      name: cdata(page?.Name) || 'Initialization',
      code: cdata(content?.Code),
      comment: cdata(content?.Comment),
    });
  }

  // --- View Elements ---
  const viewElements: ViewElement[] = [];
  const viewPages = toArr(htmlView?.['Osejs.HtmlView.Page']);
  for (const page of viewPages) {
    const content = page?.Content ?? {};
    const tree = content?.Tree ?? {};
    const elements = toArr(tree?.['HtmlView.Element']);
    for (const el of elements) {
      const props: Record<string, string> = {};
      const propNodes = toArr(el?.Property);
      for (const p of propNodes) {
        const name = p?.['@_name'];
        if (name) props[name] = cdata(p);
      }
      viewElements.push({
        id: uid(),
        type: cdata(el?.Type),
        name: cdata(el?.Name),
        parent: cdata(el?.Parent),
        properties: props,
      });
    }
  }

  return {
    info: {
      title: cdata(info?.Title) || 'Untitled',
      author: cdata(info?.Author),
      keywords: cdata(info?.Keywords),
      abstract: cdata(info?.Abstract),
    },
    variables,
    odePages,
    constraintPages,
    initPages,
    viewElements,
  };
}

export function serializeToEjssXML(state: SimulationState): string {
  const varPages = groupBy(state.variables, (v) => v.page || 'Variables');

  const varPagesXml = Object.entries(varPages)
    .map(
      ([pageName, vars]) => `
  <Osejs.Model.Variables.Page>
    <Type>VARIABLE_EDITOR</Type>
    <Name>${pageName}</Name>
    <Active>true</Active>
    <Content>
      ${vars
        .map(
          (v) => `<Variable>
        <Name><![CDATA[${v.name}]]></Name>
        <Value><![CDATA[${v.value}]]></Value>
        <Type><![CDATA[${v.type}]]></Type>
        <Dimension><![CDATA[]]></Dimension>
        <Comment><![CDATA[${v.comment}]]></Comment>
      </Variable>`
        )
        .join('\n      ')}
    </Content>
  </Osejs.Model.Variables.Page>`
    )
    .join('');

  const odePagesXml = state.odePages
    .map(
      (p) => `
  <Osejs.Model.Evolution.Page>
    <Type>ODE_EDITOR</Type>
    <Name>${p.name}</Name>
    <Active>true</Active>
    <Content>
      <IndependentVariable>t</IndependentVariable>
      <Increment>${p.increment}</Increment>
      ${p.rates.map((r) => `<Rate state="${r.state}"><![CDATA[${r.expression}]]></Rate>`).join('\n      ')}
      <Method>${p.method}</Method>
      <Comment><![CDATA[${p.comment}]]></Comment>
    </Content>
  </Osejs.Model.Evolution.Page>`
    )
    .join('');

  const constraintPagesXml = state.constraintPages
    .map(
      (p) => `
  <Osejs.Model.Constraints.Page>
    <Type>CODE_EDITOR</Type>
    <Name>${p.name}</Name>
    <Active>true</Active>
    <Content>
      <Code><![CDATA[${p.code}]]></Code>
      <Comment><![CDATA[${p.comment}]]></Comment>
    </Content>
  </Osejs.Model.Constraints.Page>`
    )
    .join('');

  const initPagesXml = state.initPages
    .map(
      (p) => `
  <Osejs.Model.Initialization.Page>
    <Type>CODE_EDITOR</Type>
    <Name>${p.name}</Name>
    <Active>true</Active>
    <Content>
      <Code><![CDATA[${p.code}]]></Code>
      <Comment><![CDATA[${p.comment}]]></Comment>
    </Content>
  </Osejs.Model.Initialization.Page>`
    )
    .join('');

  const viewElementsXml = state.viewElements
    .map(
      (el) => `
        <HtmlView.Element>
          <Expanded>true</Expanded>
          <Type>${el.type}</Type>
          <Name><![CDATA[${el.name}]]></Name>
          ${el.parent ? `<Parent><![CDATA[${el.parent}]]></Parent>` : ''}
          ${Object.entries(el.properties)
            .map(([k, v]) => `<Property name="${k}"><![CDATA[${v}]]></Property>`)
            .join('\n          ')}
        </HtmlView.Element>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-16"?>
<!-- Created by EjsS Scratch UI Editor -->
<Osejs version="5.01beta" password="">
<Osejs.Information>
<Title><![CDATA[${state.info.title}]]></Title>
<Author><![CDATA[${state.info.author}]]></Author>
<Keywords><![CDATA[${state.info.keywords}]]></Keywords>
<Abstract><![CDATA[${state.info.abstract}]]></Abstract>
<UseInterpreter>true</UseInterpreter>
<RunInBrowserFirst>true</RunInBrowserFirst>
</Osejs.Information>
<Osejs.Model>
<Osejs.Model.Variables>${varPagesXml}
</Osejs.Model.Variables>
<Osejs.Model.Initialization>${initPagesXml}
</Osejs.Model.Initialization>
<Osejs.Model.Evolution>${odePagesXml}
</Osejs.Model.Evolution>
<Osejs.Model.Constraints>${constraintPagesXml}
</Osejs.Model.Constraints>
</Osejs.Model>
<Osejs.View>
<Osejs.View.Creation>
</Osejs.View.Creation>
</Osejs.View>
<Osejs.HtmlView>
<Osejs.HtmlView.Page>
<Type>HTML_VIEW_EDITOR</Type>
<Name>HtmlView Page</Name>
<Content>
<SizeOption>0</SizeOption>
<Tree>${viewElementsXml}
</Tree>
</Content>
</Osejs.HtmlView.Page>
</Osejs.HtmlView>
</Osejs>`;
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    },
    {} as Record<string, T[]>
  );
}

export async function readEjssFile(file: File): Promise<SimulationState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        resolve(parseEjssXML(text));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'UTF-16');
  });
}
