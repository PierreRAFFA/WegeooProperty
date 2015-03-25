<?php

namespace Wegeoo\String\StringUtils;

class StringUtils
{
	public function removeSpecialChars($pString, $pCharset='utf-8')
	{
	    $pString = htmlentities($pString, ENT_NOQUOTES, $pCharset);
	    
	    $pString = preg_replace('#&([A-za-z])(?:acute|cedil|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $pString);
	    $pString = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $pString); // pour les ligatures e.g. '&oelig;'
	    $pString = preg_replace('#&[^;]+;#', '', $pString); // supprime les autres caractères
	    
	    return $pString;
	}
}
