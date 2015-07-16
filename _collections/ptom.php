<?php

$dbh = new PDO("pgsql:dbname=wegeoo_gb;host=localhost",'postgres', 'DOH,F;uiftUIur!' );
 
for($i=0 ; $i < 6 ; $i++)
{
   $sql = sprintf("SELECT * FROM city LIMIT %s OFFSET %s" , 2000 , ($i)*2000);
   //$sql = "SELECT * FROM city";

   $stmt = $dbh->query($sql);
   $results=$stmt->fetchAll(PDO::FETCH_ASSOC);
   $json=json_encode($results);
   echo count($results) . "\n";

   $json = preg_replace("/uppercase_name/" , "uppercaseName" , $json);
   $json = preg_replace("/parent_code/" , "parentCode" , $json);
   $json = preg_replace("/post_code/"  ,"postcode" , $json);
   $json = preg_replace("/google_localized/" , "googleLocalized" , $json);
   $json = preg_replace("/slug_name/" , "slugName" , $json);

   file_put_contents("json$i.json" , $json);
}


?>
