# Frontend - Sistema de Gestión de Logística

Esta es la aplicación frontend para el sistema de gestión de logística y flota de vehículos.

## Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/              # Componentes reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── ExpirationBadge.tsx
│   │   ├── drivers/            # Componentes para Choferes
│   │   │   ├── DriverTable.tsx
│   │   │   └── DriverForm.tsx
│   │   ├── vehicles/           # Componentes para Vehículos
│   │   │   ├── VehicleTable.tsx
│   │   │   └── VehicleForm.tsx
│   │   └── layout/
│   │       └── Layout.tsx
│   ├── hooks/
│   │   └── useApi.ts           # Hook personalizado para APIs
│   ├── pages/
│   │   ├── DriversPage.tsx     # Página de Gestión de Choferes
│   │   └── VehiclesPage.tsx    # Página de Gestión de Vehículos
│   ├── types/
│   │   └── index.ts            # Tipos TypeScript
│   ├── utils/
│   │   └── dateUtils.ts        # Utilidades para manejo de fechas
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## Características Principales

### ✅ Pantalla de Gestión de Choferes
- **Tabla de datos** con columnas: Nombre, Licencia, Tipo, Teléfono, Documento, Vencimiento Licencia, Estado
- **Búsqueda en tiempo real** por nombre, licencia o teléfono
- **Indicadores de vencimiento de licencia**:
  - 🔴 **Rojo**: Licencia vencida
  - 🟡 **Amarillo**: Vence en los próximos 15 días
  - 🟢 **Verde**: Licencia válida
- **Formulario modal** para crear y editar choferes
- **Validación de formularios** en tiempo real
- **Acciones**: Editar y Eliminar con confirmación

### ✅ Pantalla de Gestión de Vehículos
- **Tabla de datos** con columnas: Patente, Tipo, Marca, Modelo, Año, Vencimiento RTO (Camión), Vencimiento RTO (Acoplado), Estado
- **Indicadores de vencimiento de RTO**:
  - 🔴 **Rojo**: RTO vencido
  - 🟡 **Amarillo**: RTO vence en los próximos 15 días
  - 🟢 **Verde**: RTO válido
- **Búsqueda y filtrado** por patente, marca o modelo
- **Filtro por estado** (Todos, Activos, Inactivos)
- **Estadísticas** (Total, Activos, Inactivos)
- **Formulario modal** para crear y editar vehículos
- **Validación de formularios** en tiempo real
- **Acciones**: Editar y Eliminar con confirmación

## Tecnologías Utilizadas

- **React 18** - Librería UI
- **TypeScript** - Tipado estático
- **React Router v6** - Enrutamiento
- **Tailwind CSS** - Diseño y estilos
- **Axios** - Cliente HTTP
- **React Scripts** - Build y desarrollo

## Instalación

1. Navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

## Desarrollo

Inicia el servidor de desarrollo:
```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## Build

Para crear una versión de producción:
```bash
npm run build
```

## Componentes Principales

### ExpirationBadge
Componente que muestra el estado de vencimiento de una fecha con colores.

```tsx
<ExpirationBadge 
  date="2025-03-15" 
  showMessage={true}
  compact={false}
/>
```

### Table
Componente genérico para mostrar datos en tablas.

```tsx
<Table
  columns={columns}
  data={data}
  keyExtractor={(item) => item.id}
  loading={loading}
  onRowClick={handleRowClick}
/>
```

### Modal
Componente modal reutilizable.

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Título del Modal"
  size="md"
>
  {/* contenido */}
</Modal>
```

### Button
Componente de botón con múltiples variantes.

```tsx
<Button 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  onClick={handleClick}
>
  Enviar
</Button>
```

## Hooks Personalizados

### useApi
Hook para realizar llamadas a la API.

```tsx
const { loading, error, get, post, put, delete } = useApi({
  baseURL: 'http://localhost:3000/api'
});

const data = await get('/drivers');
const result = await post('/drivers', driverData);
```

## Utilidades

### dateUtils
Funciones para manejo de fechas y vencimientos:

- `getExpirationDateColor()` - Determina el color del estado
- `getExpirationColorClasses()` - Retorna clases Tailwind
- `formatDate()` - Formatea la fecha (DD/MM/YYYY)
- `getDaysUntilExpiration()` - Calcula días restantes
- `getExpirationMessage()` - Mensaje descriptivo

## Validación

### DriverForm
- Nombre: Requerido, mínimo 2 caracteres
- Licencia: Requerido, único
- Vencimiento: Requerido, fecha válida
- Documento: Opcional, mínimo 5 caracteres

### VehicleForm
- Patente: Requerida, formato válido
- Tipo: Requerido
- Año: Validación de rango (1900 - año actual + 1)
- Fechas: Validación de formato

## Estilos y Diseño

Utiliza **Tailwind CSS** con una paleta de colores coherente:

- **Primario**: Blue (#3b82f6)
- **Éxito**: Green (#10b981)
- **Peligro**: Red (#ef4444)
- **Advertencia**: Yellow (#f59e0b)
- **Secundario**: Gray (#6b7280)

## Estado de la Aplicación

El estado se maneja con:
- **React Hooks** (useState, useEffect, useCallback)
- **Props drilling** (componentes simples)
- Potencial para migrar a **Context API** o **Redux** en el futuro

## Variables de Entorno

```bash
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

## Scripts Disponibles

- `npm start` - Inicia desarrollo
- `npm run build` - Build para producción
- `npm test` - Ejecuta tests
- `npm run eject` - Ejecta configuración (no reversible)

## Notas Importantes

✅ **UI/UX Optimizado**: Interfaz limpia, intuitiva y responsiva
✅ **Manejo de Estados**: Implementado con React Hooks
✅ **Validación**: Formularios con validación en tiempo real
✅ **Indicadores Visuales**: Colores y badges para estados
✅ **Tablas Profesionales**: Diseño con Tailwind, búsqueda y filtrado
✅ **Modales**: Para crear y editar registros
✅ **Mensajes de Error**: Notificaciones al usuario
✅ **Loading States**: Indicadores durante carga

## Próximos Pasos (Futuro)

- [ ] Tests unitarios con Jest y React Testing Library
- [ ] Autenticación y gestión de tokens
- [ ] Paginación en tablas
- [ ] Export a Excel/PDF
- [ ] Gráficos y dashboards
- [ ] Notificaciones en tiempo real
- [ ] Gestión de estado global con Redux
