// ───  Interfaces de Contrato para el Catálogo Geográfico ───────────────────
export interface IDepartamento {
    id_departamento: string;
    nombre_departamento?: string;
}

export interface IMunicipio {
    id_municipio: string;
    nombre_municipio?: string;
    departamento?: IDepartamento; // Relación anidada
}

export interface IVeredaGeografica {
    id_vereda: string;
    nombre_vereda?: string;
    municipio?: IMunicipio; // Relación anidada
}