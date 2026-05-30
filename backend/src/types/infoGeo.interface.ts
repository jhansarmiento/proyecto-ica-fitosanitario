// ───  Interfaces de Contrato para el Catálogo Geográfico ───────────────────
export interface IDepartamento {
    id_departamento: string;
    nombre?: string;
}

export interface IMunicipio {
    id_municipio: string;
    nombre?: string;
    departamento?: IDepartamento; // Relación anidada
}

export interface IVeredaGeografica {
    id_vereda: string;
    nombre?: string;
    municipio?: IMunicipio; // Relación anidada
}