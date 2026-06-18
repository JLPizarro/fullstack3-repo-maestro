from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class ReportesBase(BaseModel):
    report_id: str
    sequential_id: Optional[int] = None
    report_date: Optional[datetime] = None
    input_date: Optional[datetime] = None
    device_id: Optional[int] = None
    holder_id: Optional[int] = None
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    event_id: Optional[int] = None
    event_name: Optional[str] = None
    gps_validity: Optional[int] = None
    gps_satellites: Optional[int] = None
    gps_dop: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location: Optional[str] = None
    area_type: Optional[str] = None
    speed: Optional[float] = None
    heading: Optional[int] = None
    odometer: Optional[float] = None
    hourmeter: Optional[float] = None
    total_fuel_used: Optional[float] = None
    obc_hourmeter: Optional[float] = None
    obc_odometer: Optional[float] = None
    parameter_value: Optional[str] = None
    parameter_id: Optional[int] = None
    parameter_name: Optional[str] = None
    ralenti_band_time: Optional[int] = None
    yellow_band_time: Optional[int] = None
    efficient_handling_band_time: Optional[int] = None
    red_band_time: Optional[int] = None
    load_over_75_band_time: Optional[int] = None
    inefficient_cruise_control_band_time: Optional[int] = None
    engine_braking_time: Optional[int] = None
    cartography_limit_speed: Optional[float] = None
    gps_speed: Optional[float] = None
    driver_name: Optional[str] = None
    driver_last_name: Optional[str] = None
    driver_document_type: Optional[str] = None
    driver_document_number: Optional[str] = None
    ignition: Optional[bool] = None
    ignition_date: Optional[datetime] = None

class ReportesCreate(ReportesBase):
    pass

class ReportesResponse(ReportesBase):
    fecha_registro: datetime
    model_config = ConfigDict(from_attributes=True)
