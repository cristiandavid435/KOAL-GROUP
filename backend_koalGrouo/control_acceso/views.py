from rest_framework import viewsets, status
from rest_framework.decorators import action,api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import ControlDeIngreso, Empleado, Proyecto
from .serializers import ControlDeIngresoSerializer
from administracion.permisos import EsSupervisor,EsAdministrador

class ControlDeIngresoViewSet(viewsets.ModelViewSet):
    
    # ViewSet para manejar el control de ingreso de empleados
    queryset = ControlDeIngreso.objects.all()
    serializer_class = ControlDeIngresoSerializer
    permission_classes = [EsSupervisor ,EsAdministrador]

    @action(detail=False, methods=['post'], url_path='registrar-entrada-salida')
    # -Si el empleado ya tiene una entrada hoy sin salida, se registra la salida.
    # -Si no, se registra la entrada.
    
    def registrar_entrada_salida(self, request):
        
        #Obtener datos del request
        cedula = request.data.get('cedula')
        nombre = request.data.get('nombre')
        estado_salud = request.data.get('estado_salud')
        lugar_trabajo = request.data.get('lugar_trabajo') # Nuevo campo para el área de trabajo
        observacion = request.data.get('observacion')

        # Validar que se reciban los datos obligatorios
        # Si no se reciben los datos obligatorios, retornar un error
        if not (cedula and nombre and estado_salud and lugar_trabajo):
            return Response({'detail': 'Datos obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        #Buscar el empleado por cédula y nombre
        try:
            empleado = Empleado.objects.get(cedula=cedula, nombres=nombre)
        except Empleado.DoesNotExist:
            return Response({'detail': 'Empleado no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        
        #Obtiene la fecha actual
        hoy = timezone.localdate()
        
         # 1. Buscar si ya existe un registro COMPLETO para el empleado hoy (entrada y salida)
        registro_completo_hoy = ControlDeIngreso.objects.filter(
            cedula=empleado,
            fecha =hoy ,
            hora_entrada__isnull=False,
            hora_salida__isnull=False
        ).exists()
        
        # Si ya está registrado con su entrada y salida en el día de hoy
        if registro_completo_hoy:
            return Response (
                {'detail': 'El empleado ya terminó su dia de trabajo'}, status= status.HTTP_409_CONFLICT
            )
        
        #Buscar si ya existe un registro de entrada para el empleado hoy sin salida
        registro = ControlDeIngreso.objects.filter(
            cedula=empleado,
            fecha=hoy,
            hora_salida__isnull=True
        ).last()

        if registro:
            # Si ya existe un registro de entrada sin salida , registrar la salida
            registro.hora_salida = timezone.localtime().time()
            registro.estado_salud_Salida = estado_salud
            registro.save()
            return Response({'detail': 'Salida registrada correctamente.'}, status=status.HTTP_200_OK)
        else:
            # Registrar entrada
            #Si no existe registrar una nueva  entrada 
            proyecto = Proyecto.objects.first()
            if not proyecto:
                return Response({'detail': 'No hay proyectos disponibles para asignar.'}, status=status.HTTP_400_BAD_REQUEST)
            ControlDeIngreso.objects.create(
                cedula=empleado,
                fecha=hoy,
                hora_entrada=timezone.localtime().time(),
                estado_salud_entrada=estado_salud,
                proyecto=proyecto,
                lugar_trabajo=lugar_trabajo,
                observacion=observacion
            )
            return Response({'detail': 'Entrada registrada correctamente.'}, status=status.HTTP_201_CREATED)
        
    
@api_view(['GET'])

## Esta vista permite buscar un empleado en la base de datos a partir de su cédula.
## Solo acepta solicitudes HTTP de tipo GET
        
def buscar_empleado_por_cedula(request):
    
    ## Se obtiene el valor del parámetro 'cedula' desde la URL.
    ## Ejemplo de llamada: /api/buscar_empleado_por_cedula?cedula=123456
    cedula = request.GET.get('cedula')
    
    ## Si no se proporciona la cédula, se retorna un error 400 (Bad Request)
    ## indicando que la cédula es requerida.
    if not cedula :
        return Response({'detail': 'Cédula requerida'},status=400)
    try:
        ## Se intenta buscar en la base de datos un empleado con la cédula dada.
        ## Si no se encuentra, se lanza la excepción Empleado.DoesNotExist.
        empleado =Empleado.objects.get(cedula=cedula) 
        ## Si se encuentra el empleado, se devuelve su nombre en la respuesta.
        return Response ({'nombre': empleado.nombres})
    except Empleado.DoesNotExist:
        ## Si no se encuentra ningún empleado con esa cédula,
        ## se devuelve un error 404 (Not Found) con un mensaje.
        return Response({'detail': 'La cedula no coincide con el nombre.'}, status=404)
    
@api_view(['GET'])

def buscar_area_por_cedula(request):
    # Obtiene el párametro 'cedula' de la consulta GET
    cedula = request.GET.get('cedula')
    #Si no se proporciona la cédula, retorna un error 400
    
    if not cedula:
        return Response({'detail': 'Cédula requerida'}, status=400)
    try:
        #Busca el empleado en la base de datos usando la cédula 
        empleado = Empleado.objects.get(cedula=cedula)
        
        #Busca el último registro de entrada (hora_entrada no nula) de ese empleado,
        #ordenando por fecha y hora de entrada descendente 
        
        ultimo_registro = ControlDeIngreso.objects.filter(
            cedula=empleado,
            hora_entrada__isnull= False 
        ).order_by('-fecha', '-hora_entrada').first()
        
        if ultimo_registro and ultimo_registro.lugar_trabajo:
            return Response({'area':ultimo_registro.lugar_trabajo})
        else:
            # Si no encuentra un área previa , retorna un error 404
            return Response({'detail':'No se encontró un área de trabajo previa para este empleado'}, status=404)
        
    except Empleado.DoesNotExist:
        # Si la cédula no corresponde a ningún empleado, retorna un error 404
        return Response({'detail': 'La cédula no coincide con ningún empleado.'}, status=404)
    
@api_view(['GET'])

def filtro_de_busqueda_con_cedula_empleado(request):
    cedula = request.GET.get('cedula', '')
    nombres = request.GET.get('nombres', '')
    
    empleados =Empleado.objects.all()
    if nombres:
        empleados = empleados.filter(nombres__icontains=nombres)
    
    #Traer los registros de acceso de esos empleados
    
    registros = ControlDeIngreso.objects.filter(cedula__in=empleados).order_by('-fecha', '-hora_entrada')
        
    # Serializa los datos que necesito devolver al hacer el filtro de búsqueda
    data = []
    serializer = ControlDeIngresoSerializer(registros, many=True)
    return Response(serializer.data)

# Create your views here.
