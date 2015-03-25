<?php
/**
 * Created by PhpStorm.
 * User: Pierre RAFFA
 * Date: 21/12/14
 * Time: 11:53
 */

namespace Wegeoo\DataLayerBundle\Entity\Utils;


class ClassifiedUtils
{
    public static $MEDIA_ALLOWED_EXTENSIONS  = ["jpg","png","jpeg"];

    public static $FIELDS       = array("ty" => "type", "cn" => "cityName" , "cp" => "cityPostCode" ,"pr" => "price", "pt" => "propertyType" ,"nr" => "numRooms" );
    //public static $FIELDS_TYPE  = array("ty" => "string", "cn" => "string" , "cp" => "string" ,"pr" => "interval" , "pt" => "array" ,"nr" => "array" );
    public static $FIELDS_TYPE  = [
        "theme" => "string",
        "category" => "string",
        "cityName" => "string" ,
        "cityPostCode" => "string" ,
        "map" => "latLngZoom" ,
        "pr" => "interval" ,
        "pt" => "array" ,
        "nr" => "array"
    ];
}