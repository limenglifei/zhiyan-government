# China provincial GeoJSON source notes

- Bundled asset: enterprise-migration-map-data.js (GeoJSON embedded for offline loading)
- Downloaded: 2026-09-11
- Primary data source: https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
- Provider tool: https://datav.aliyun.com/portal/school/atlas/area_selector
- Official usage documentation: https://help.aliyun.com/zh/datav/datav-6-0/user-guide/regional-thermal-layer
- Raw byte size: 582522

The downloaded FeatureCollection contains 35 features: 34 named province-level entities (including Taiwan, Hong Kong, and Macao) and one unnamed boundary feature with adcode 100000_JD. Geometry types are Polygon and MultiPolygon; implementations must support both. The unnamed feature must not receive an empty interactive province label.

Province features supply properties.adcode, properties.name, and properties.center. Most also supply properties.centroid; Hebei and Gansu omit centroid, so province labels fall back to center. Label placement uses small visual offsets for crowded municipalities.

The raw data includes southern maritime geometry in Hainan province down to approximately latitude 3.82 and in the 100000_JD feature down to approximately latitude 3.40. Preserve it. For a compact dashboard, use a southern maritime inset instead of silently discarding all geometry below latitude 18.

License status: the official documentation presents GeoAtlas as an administrative-boundary extraction tool for geographic data visualization, but no independent permissive open-source license was identified. Do not describe this data as MIT or Apache-licensed. Retain this source attribution in project documentation.
