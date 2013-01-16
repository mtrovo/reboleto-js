var DIA_EM_MS=1000*60*60*24;
var DIA_0=new Date(Date.UTC(1997,9,7));
var MASCARA_PRECO="0000000000"
var MASCARA_DIAS="0000"

var Boleto = (function(){
  function Boleto(num){
    this.num=num;
    var $ = num.match(/^(\d{3})(\d)(\d{5})(\d)(\d{5})(\d{5})(\d)(\d{10})(\d)(\d)(\d{4})(\d{10})$/)
    if(!$) throw new Error("Número de boleto inválido")
    
    // separa os campos
    this.banco=$[1]
    this.moeda=$[2]
    this.vencimento=$[11]
    this.preco=$[12]
    this.nosso_numero=$[3]+$[5]
    this.favorecido=$[6]+$[8]
    this.digito1=$[4]
    this.digito2=$[7]
    this.digito3=$[9]
    this.digito_geral=$[10]
  }
  
  Boleto.prototype.getVencimentoComoData=function(){
    return this.getDiasComoData(parseInt(this.vencimento))
  }
  
  Boleto.prototype.getDiasComoData=function(dias){
    return new Date(DIA_0.getTime() + dias*DIA_EM_MS)
  }
  
  Boleto.prototype.getDateComoDias=function(dt){
    return (dt.getTime()-DIA_0.getTime())/DIA_EM_MS
  }
  
  Boleto.prototype.formatarPreco=function(p){
    p=p.replace(/,|\./g,'')
    return MASCARA_PRECO.substring(p.length)+p
  }
  
  Boleto.prototype.alterarVencimento=function(dt){
    if(dt.getUTCHours() != 0) throw Error("Data deve ser uma data em UTC");
    if(dt.getTime()<DIA_0.getTime()) throw Error("Data inválida");
    var dias = '' + this.getDateComoDias(dt)
    this.vencimento=MASCARA_DIAS.substring(dias.length) + dias
    this.atualizarDigitoGeral()
  }
  
  Boleto.prototype.alterarValor=function(vl){
    this.preco=this.formatarPreco(vl)
    this.atualizarDigitoGeral()
  }
  
  Boleto.prototype.atualizarDigitoGeral=function(){
    this.digito_geral=this.__calcularDigitoGeral()
  }
  
  Boleto.prototype.getNumeroFormatado=function(){
    return this.banco + this.moeda + this.nosso_numero[0] + '.' + this.nosso_numero.substring(1,5) + this.digito1 + ' ' + 
           this.nosso_numero.substring(5) + '.' + this.favorecido.substring(0,5) + this.digito2 + ' ' +
           this.favorecido.substring(5,10) + '.' + this.favorecido.substring(10,15) + this.digito3 + ' ' +
           this.digito_geral + ' '+
           this.vencimento+this.preco
  }
  
  Boleto.prototype.__calcularDigitoGeral=function(){
    var reg=this.banco+this.moeda+this.vencimento+this.preco+this.nosso_numero+this.favorecido
    var sum = reg.split('').reverse().reduce(function(p,c,i){
      c=parseInt(c)
      return p + (i%8 + 2)*c
    },0)
    sum = 11-(sum%11)
    if(sum>9) sum=1
    return sum
  }
  
  return Boleto
})()
