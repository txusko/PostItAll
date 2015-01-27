<?php

class PostItAll
{
	//DB Configuration
	private $db_host 		= "127.0.0.1";
	private $db_user 		= "root";
	private $db_password 	= "";
	private $db_database	= "test";
	private $db_port		= "3306";
	private $mysqli 		= null;

	public $iduser 	= -1;
	public $option 	= "";
	public $content = "";

	function __construct() {
		//Connection
		$this->mysqli = mysqli_connect($this->db_host, $this->db_user, $this->db_password, $this->db_database, $this->db_port) or die("Error " . mysqli_error($link)); 
		//Create table
		$this->createTable() or die("Table creation error " . mysqli_error($link));
   	}

   	function __destruct() {
   		//Close connection
		$this->mysqli->close();
   	}

   	public function main() {
   		//Get Request
		$this->getRequest();

   		switch ($this->option) {
			
			//Save data
			case 'save':
				return $this->save($this->iduser, $this->content);
				break;

			//Load user data
			case 'load':
				if($data = $this->getData($this->iduser))
					return $data;
				else
					return "no data found ".$this->iduser;
				break;

			//Remove user data
			case 'remove':
				return $this->removeData($this->iduser);
				break;

			default:
				return "Option ".$this->option." not implemented";
				break;
		}
   	}

   	private function getRequest() {
   		//TODO: Sanitize variables
		//Option
		if(!isset($_REQUEST["option"]) || !$_REQUEST["option"])
			die("No option");
		$this->option = $_REQUEST["option"];
		//Id user
		$this->iduser = 1;
		if(isset($_REQUEST["iduser"]) && $_REQUEST["iduser"])
			$this->iduser = intval($_REQUEST["iduser"]);
		//Content
		$this->content = "";
		if(isset($_REQUEST["content"]) && $_REQUEST["content"])
			$this->content = mysqli_escape_string($this->mysqli, $_REQUEST["content"]);
   	}

	private function createTable() {
		$createdb = "CREATE TABLE IF NOT EXISTS `postitall` (
		  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
		  `iduser` int(11) unsigned NOT NULL,
		  `content` text,
		  PRIMARY KEY (`id`)
		) ENGINE=MyISAM DEFAULT CHARSET=utf8;";
		return $this->mysqli->query($createdb);
	}

	public function getData($idUser) {
		$sql = "select content from postitall where iduser = " . $idUser;
		$resultado = $this->mysqli->query($sql);
		$array = $resultado->fetch_array();
		return $array["content"];
	}

	protected function save($idUser, $content)
	{
		if($this->getData($idUser))
			return $this->updateData($idUser, $content);
		else
			return $this->insertData($idUser, $content);
	}

	private function insertData($idUser, $content) {
		$sql = "insert into postitall (iduser, content) values (".$idUser.",'".$content."')";
		return $this->mysqli->query($sql);	
	}

	private function updateData($idUser, $content) {
		$sql = "update postitall set content='".$content."' where iduser=".$idUser;
		return $this->mysqli->query($sql);	
	}

	private function removeData($idUser) {
		$sql = "delete from postitall where iduser=".$idUser;
		return $this->mysqli->query($sql);
	}
}


$pia = new PostItAll();
echo $pia->main();

?>